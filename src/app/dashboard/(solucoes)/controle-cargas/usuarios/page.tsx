/* eslint-disable prettier/prettier */
'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = process.env
  .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string

const supabase: SupabaseClient = (typeof window !== 'undefined' &&
  createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)) as SupabaseClient

type CardRow = {
  id: number
  uid: string
  nome: string
  cpf: string
  status: boolean
  createdAt: string
}

type RawCard = {
  id?: number
  uid?: string | null
  nome?: string | null
  cpf?: string | null
  status?: boolean | null
  createdAt?: string | null
  created_at?: string | null
}

type UserGroup = {
  cpf: string
  nome: string
  records: CardRow[]
}

const Usuarios = () => {
  const [rows, setRows] = useState<CardRow[]>([])
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filterNome, setFilterNome] = useState('')
  const [filterCpf, setFilterCpf] = useState('')

  const [editingCpf, setEditingCpf] = useState<string | null>(null)
  const [editRecords, setEditRecords] = useState<CardRow[]>([])

  // new card flow (modal)
  const [readingCard, setReadingCard] = useState(false)
  const [readUid, setReadUid] = useState('')
  const hiddenInputRef = useRef<HTMLInputElement | null>(null)

  // new user form
  const [newNome, setNewNome] = useState('')
  const [newCpf, setNewCpf] = useState('')
  const [newStatus, setNewStatus] = useState(true)
  const [newCardUid, setNewCardUid] = useState('')

  // editing inputs
  const [nameInput, setNameInput] = useState('')
  const [cpfInput, setCpfInput] = useState('')

  const fetchRows = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: supError } = await supabase
        .from('rfid_cards')
        .select('*')

      if (supError) {
        setError(supError.message)
        setRows([])
      } else {
        // normalize data
        const raw = (data ?? []) as RawCard[]
        const parsed: CardRow[] = raw.map((r, i) => ({
          id: r.id ?? i,
          uid: String(r.uid ?? ''),
          nome: String(r.nome ?? ''),
          // normalize CPF to digits-only for consistent grouping and comparisons
          cpf: unformatCPF(String(r.cpf ?? '')),
          status: !!r.status,
          createdAt: r.createdAt ?? r.created_at ?? '',
        }))
        setRows(parsed)
      }
    } catch (err) {
      setError(String(err))
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  // helpers for CPF formatting and date formatting
  const formatCPF = (v?: string) => {
    if (!v) return ''
    const digits = v.replace(/\D/g, '')
    if (digits.length !== 11) return digits
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const unformatCPF = (v?: string) => {
    return (v || '').toString().replace(/\D/g, '')
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  useEffect(() => {
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // group by CPF and pick a representative name
    const groupsMap = new Map<string, CardRow[]>()
    rows.forEach((r) => {
      const key = r.cpf || '__empty__'
      if (!groupsMap.has(key)) groupsMap.set(key, [])
      groupsMap.get(key)!.push(r)
    })

    const g: UserGroup[] = Array.from(groupsMap.entries()).map(
      ([cpf, recs]) => ({
        cpf: cpf === '__empty__' ? '' : cpf,
        nome: recs.find((x) => x.nome)?.nome || recs[0]?.nome || '',
        records: recs,
      })
    )

    // apply filters (filter by name and cpf if provided)
    const filtered = g.filter((grp) => {
      const matchesNome = filterNome
        ? grp.nome.toLowerCase().includes(filterNome.toLowerCase())
        : true
      const matchesCpf = filterCpf ? grp.cpf.includes(filterCpf) : true
      return matchesNome && matchesCpf
    })

    setGroups(filtered)
  }, [rows, filterNome, filterCpf])

  const startEdit = (cpf: string) => {
    setEditingCpf(cpf)
    const recs = rows.filter((r) => r.cpf === cpf)
    setEditRecords(recs)
    // prefill editable inputs with representative values
    setNameInput(recs.find((x) => x.nome)?.nome || recs[0]?.nome || '')
    setCpfInput(formatCPF(cpf))
  }

  const saveEdits = async () => {
    // batch update statuses
    try {
      for (const r of editRecords) {
        await supabase
          .from('rfid_cards')
          .update({ status: r.status })
          .eq('uid', r.uid)
      }
      // update name and cpf for the group if changed
      if (editingCpf) {
        const newCpfRaw = unformatCPF(cpfInput)
        const newName = nameInput
        // update all records where cpf (normalized) matches the editing cpf
        await supabase
          .from('rfid_cards')
          .update({ nome: newName, cpf: newCpfRaw })
          .eq('cpf', unformatCPF(editingCpf))
      }
      // refresh
      await fetchRows()
      setEditingCpf(null)
      setEditRecords([])
    } catch (err) {
      setError(String(err))
    }
  }

  const deleteUid = async (uid: string) => {
    if (!confirm('Confirma exclusão deste cartão?')) return
    try {
      // optimistically remove from UI
      setEditRecords((prev) => prev.filter((r) => r.uid !== uid))
      await supabase.from('rfid_cards').delete().eq('uid', uid)
      // refresh full list in background
      fetchRows().catch(() => {})
      // if currently editing, refresh the editRecords view
      if (editingCpf) startEdit(editingCpf)
    } catch (err) {
      setError(String(err))
    }
  }

  const openCardReader = (forNewUser = false) => {
    setReadingCard(true)
    setReadUid('')
    // focus hidden input to simulate card reader keyboard input
    setTimeout(() => hiddenInputRef.current?.focus(), 50)
    // store whether this is for new user by a simple flag in state (newCardUid)
    if (!forNewUser) setNewCardUid('')
  }

  const onCardInput = (value: string, forNew = false) => {
    const v = value.trim()
    if (!v) return
    setReadUid(v)
    if (forNew) setNewCardUid(v)
  }

  // focus the hidden input when modal opens so card readers send data there
  useEffect(() => {
    if (readingCard) {
      // clear previous value
      try {
        if (hiddenInputRef.current) hiddenInputRef.current.value = ''
      } catch (e) {
        /* ignore */
      }
      setTimeout(() => hiddenInputRef.current?.focus(), 50)
    }
  }, [readingCard])

  const confirmAddCardToUser = async () => {
    if (!editingCpf) return
    if (!readUid) return
    // create new rfid_cards record for this user
    try {
      const cpfRaw = unformatCPF(editingCpf || '')
      await supabase.from('rfid_cards').insert({
        uid: readUid,
        nome: editRecords[0]?.nome || '',
        cpf: cpfRaw,
        status: true,
      })
      // optimistically append to editRecords so the UI shows the new card immediately
      setEditRecords((prev) => [
        ...prev,
        {
          id: Date.now(),
          uid: readUid,
          nome: editRecords[0]?.nome || '',
          cpf: cpfRaw,
          status: true,
          createdAt: new Date().toISOString(),
        },
      ])
      // refresh full list in background
      fetchRows().catch(() => {})
      setReadUid('')
      setReadingCard(false)
    } catch (err) {
      setError(String(err))
    }
  }

  const confirmCreateUser = async () => {
    if (!newNome || !newCpf || !newCardUid) {
      alert('Preencha nome, cpf e aproxime um cartão')
      return
    }
    try {
      await supabase.from('rfid_cards').insert({
        uid: newCardUid,
        nome: newNome,
        cpf: unformatCPF(newCpf),
        status: newStatus,
      })
      // reset form
      setNewNome('')
      setNewCpf('')
      setNewStatus(true)
      setNewCardUid('')
      await fetchRows()
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div className="p-6 w-4/5">
      <h1 className="text-xl font-semibold mb-4">Usuários</h1>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Filtrar por nome"
          value={filterNome}
          onChange={(e) => setFilterNome(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Filtrar por CPF"
          value={filterCpf}
          onChange={(e) => setFilterCpf(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={fetchRows}
          >
            Atualizar
          </button>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => {
              setEditingCpf('__new__')
            }}
          >
            Cadastrar novo usuário
          </button>
        </div>
      </div>

      <div className="mb-4">
        {loading ? (
          <span>Carregando...</span>
        ) : error ? (
          <span className="text-red-600">Erro: {error}</span>
        ) : null}
      </div>

      {/* grouped users table */}
      {!editingCpf && (
        <div className="border rounded">
          <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">CPF</th>
                  <th className="p-2 text-left">Qtd. cartões</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, idx) => (
                  <tr key={g.cpf || `grp-${idx}`} className="border-t">
                    <td className="p-2">{g.nome}</td>
                    <td className="p-2">{formatCPF(g.cpf)}</td>
                    <td className="p-2">{g.records.length}</td>
                    <td className="p-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => startEdit(g.cpf)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* editing view */}
      {editingCpf && editingCpf !== '__new__' && (
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              Editando usuário: {nameInput}
            </h2>
            <div className="flex gap-2">
              <button
                className="bg-gray-200 px-2 py-1 rounded"
                onClick={() => {
                  setEditingCpf(null)
                  setEditRecords([])
                }}
              >
                Fechar
              </button>
              <button
                className="bg-green-600 text-white px-2 py-1 rounded"
                onClick={saveEdits}
              >
                Salvar alterações
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                className="border rounded px-2 py-1"
                placeholder="Nome (preencha o nome)"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="CPF (preencha o CPF)"
                value={cpfInput}
                onChange={(e) => setCpfInput(e.target.value)}
              />
            </div>
            <div>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => openCardReader(false)}
              >
                Adicionar novo cartão
              </button>
            </div>
          </div>

          {/* when modal is open we focus the hidden input in the modal below */}

          {readUid && (
            <div className="mb-3">
              <div className="inline-flex items-center gap-2">
                <span className="text-green-600">
                  ✔ Cartão lido: {readUid}
                </span>
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded"
                  onClick={confirmAddCardToUser}
                >
                  Confirmar
                </button>
                <button
                  className="bg-gray-200 px-2 py-1 rounded"
                  onClick={() => setReadUid('')}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="overflow-auto" style={{ maxHeight: '50vh' }}>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Cartão</th>
                  <th className="p-2 text-left">Criado em</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {editRecords.map((r) => (
                  <tr key={r.uid} className="border-t">
                    <td className="p-2 break-all">{r.uid}</td>
                    <td className="p-2">{formatDateTime(r.createdAt)}</td>
                    <td className="p-2">
                      <select
                        value={String(r.status)}
                        onChange={(e) => {
                          const v = e.target.value === 'true'
                          setEditRecords((prev) => {
                            return prev.map((x) => {
                              return x.uid === r.uid ? { ...x, status: v } : x
                            })
                          })
                        }}
                        className="border rounded px-2 py-1"
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded"
                        onClick={() => deleteUid(r.uid)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {editRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Nenhum cartão cadastrado para este usuário
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* new user form */}
      {editingCpf === '__new__' && (
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Cadastrar novo usuário</h2>
            <div className="flex gap-2">
              <button
                className="bg-gray-200 px-2 py-1 rounded"
                onClick={() => {
                  setEditingCpf(null)
                }}
              >
                Cancelar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              className="border rounded px-2 py-1"
              placeholder="Nome"
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="CPF"
              value={newCpf}
              onChange={(e) => setNewCpf(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm">Status</label>
              <select
                className="border rounded px-2 py-1"
                value={String(newStatus)}
                onChange={(e) => setNewStatus(e.target.value === 'true')}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => openCardReader(true)}
              >
                Adicionar cartão
              </button>
              {newCardUid ? (
                <span className="text-green-600">
                  ✔ Cartão lido: {newCardUid}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={confirmCreateUser}
            >
              Criar usuário
            </button>
            <button
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={() => {
                setEditingCpf(null)
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* hidden input to capture card reads globally */}
      {/* centered modal for card reading */}
      {readingCard && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-transparent"></div>
          <div className="bg-white rounded-lg p-6 z-60 w-96 pointer-events-auto">
            <h3 className="text-lg font-semibold mb-3">Aproxime o cartão</h3>
            <p className="text-sm text-gray-600 mb-4">
              Coloque o cartão no leitor. O campo será preenchido
              automaticamente.
            </p>
            <div className="mb-4">
              <input
                ref={hiddenInputRef}
                onInput={(e) =>
                  onCardInput(
                    (e.target as HTMLInputElement).value,
                    editingCpf === '__new__'
                  )
                }
                onKeyDown={(e) => {
                  // some readers send key events; handle Enter as finalizer
                  if (e.key === 'Enter') {
                    const v = (e.target as HTMLInputElement).value.trim()
                    if (v) setReadUid(v)
                  }
                }}
                className="opacity-0 pointer-events-auto absolute"
              />
              <div className="h-12 flex items-center justify-center border rounded">
                {readUid ? (
                  <span className="text-green-600">
                    ✔ Cartão lido: {readUid}
                  </span>
                ) : (
                  <span className="text-gray-700">Aguardando leitura...</span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-200 px-3 py-1 rounded"
                onClick={() => {
                  setReadingCard(false)
                  setReadUid('')
                }}
              >
                Cancelar
              </button>
              {editingCpf === '__new__' ? (
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => {
                    // assign newCardUid and close
                    setNewCardUid(readUid)
                    setReadingCard(false)
                  }}
                >
                  Usar cartão lido
                </button>
              ) : (
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={confirmAddCardToUser}
                >
                  Confirmar inclusão
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
