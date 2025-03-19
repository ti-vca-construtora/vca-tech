import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'cvcrm/1.0.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Empreendimento é um conjunto de unidades (imóveis) para venda ou aluguel. Esta
   * integração coleta informações de requisições realizadas por sistemas legados e verifica
   * se o dado inserido no campo 'nome' existe ou não no Construtor de Vendas. Se já existir
   * um empreendimento cadastrado com o mesmo nome, essa API irá atualizar os dados
   * solicitados na requisição, se não irá cadastrá-los.
   *
   * **Obs: Somente será aceito um cadastro por nome. O campo estado deve ter a sigla em
   * letras MAIÚSCULAS (Exemplo: São Paulo = SP).**
   *
   * @summary Cadastra empreendimento.
   * @throws FetchError<400, types.CadastrarEmpreendimentoResponse400> Requisição de cadastro de empreendimento incorreta!
   * @throws FetchError<404, types.CadastrarEmpreendimentoResponse404> Nenhum dado encontrado!
   */
  cadastrarEmpreendimento(body: types.CadastrarEmpreendimentoBodyParam, metadata: types.CadastrarEmpreendimentoMetadataParam): Promise<FetchResponse<200, types.CadastrarEmpreendimentoResponse200>> {
    return this.core.fetch('/cvio/empreendimento', 'post', body, metadata);
  }

  /**
   * A api retornará o resumo de todos os empreendimentos cadastrados e ativos no ambiente do
   * cliente. Para obter mais detalhes do empreendimento utilize a api
   * cvio/empreendimento/{idempreendimento}
   *
   * @summary Retorna empreendimentos.
   * @throws FetchError<422, types.RetornarEmpreendimentosResponse422> Erro ao tentar retornar empreendimentos.
   */
  retornarEmpreendimentos(metadata: types.RetornarEmpreendimentosMetadataParam): Promise<FetchResponse<200, types.RetornarEmpreendimentosResponse200>> {
    return this.core.fetch('/cvio/empreendimento', 'get', metadata);
  }

  /**
   * Essa interface trará todos os dados de um determinado empreendimento, serão
   * disponibilizadas as informações de todos os blocos, etapas e unidades do empreendimento
   * selecionado.
   *
   * @summary Retorna empreendimento.
   * @throws FetchError<422, types.RetornarEmpreendimentoResponse422> Erro ao retornar empreendimento.
   */
  retornarEmpreendimento(metadata: types.RetornarEmpreendimentoMetadataParam): Promise<FetchResponse<200, types.RetornarEmpreendimentoResponse200>> {
    return this.core.fetch('/cvio/empreendimento/{idEmpreendimento}', 'get', metadata);
  }

  /**
   * Etapa é um conjunto de blocos pertencentes a um empreendimento. Quando essa interface
   * for consumida uma nova etapa será criada dentro de um empreendimento no Construtor de
   * Vendas, ela irá verificar se o dado inserido no campo idetapa_int existe ou não no
   * Construtor de Vendas, se já existir uma etapa cadastrada com o mesmo idetapa_int, essa
   * API irá atualizar os dados solicitados na requisição, se não irá cadastrá-los.
   *
   * **Obs: Para que a etapa seja inserida no Contrutor de Vendas, o identificador do
   * empreendimento deve existir no sistema. Somente será aceito um cadastro por nome**
   *
   * @summary Cadastra etapa.
   * @throws FetchError<400, types.CadastroEtapaResponse400> Requisição de cadastro de etapa incorreta!
   * @throws FetchError<422, types.CadastroEtapaResponse422> Erro ao tentar cadastrar etapa.
   */
  cadastroEtapa(body: types.CadastroEtapaBodyParam, metadata: types.CadastroEtapaMetadataParam): Promise<FetchResponse<200, types.CadastroEtapaResponse200>> {
    return this.core.fetch('/cvio/etapa', 'post', body, metadata);
  }

  /**
   * Bloco é um conjunto de unidades de um empreendimento. Quando essa interface for
   * consumida um novo bloco será cadastrado no CV, logo após irá verificar se o dado
   * inserido no campo idbloco_int existe ou não no CVs, se já existir um bloco cadastrado
   * com o mesmo idbloco_int essa API irá atualizar os dados solicitados na requisição, se
   * não irá cadastrá-los.
   *
   * **Obs: Para que essas informações sejam inseridas no CV, os identificadores da etapa e
   * do empreendimento devem existir no sistema.**
   *
   * @summary Cadastra bloco.
   * @throws FetchError<400, types.CadastroBlocoResponse400> Requisição de cadastro de bloco incorreta!
   * @throws FetchError<422, types.CadastroBlocoResponse422> Erro ao tentar cadastrar bloco.
   */
  cadastroBloco(body: types.CadastroBlocoBodyParam, metadata: types.CadastroBlocoMetadataParam): Promise<FetchResponse<200, types.CadastroBlocoResponse200>> {
    return this.core.fetch('/cvio/bloco', 'post', body, metadata);
  }

  /**
   * Unidade é um imóvel do empreendimento. Quando essa interface for consumida uma nova
   * unidade será cadastrada no Construtor de Vendas. A interface irá verificar se o dado
   * inserido no campo idbloco_int existe ou não no CV, se já existir um bloco cadastrado com
   * o mesmo idbloco_int essa API irá atualizar os dados solicitados na requisição, se não
   * irá cadastrá-los.
   *
   * **Obs: Para que essas informações sejam inseridas no CV, os identificadores da etapa e
   * do empreendimento devem existir no sistema.**
   *
   * @summary Cadastra unidade.
   * @throws FetchError<400, types.CadastroUnidadeResponse400> Requisição de cadastro de unidade incorreta!
   * @throws FetchError<422, types.CadastroUnidadeResponse422> Erro ao tentar cadastrar unidade.
   */
  cadastroUnidade(body: types.CadastroUnidadeBodyParam, metadata: types.CadastroUnidadeMetadataParam): Promise<FetchResponse<200, types.CadastroUnidadeResponse200>> {
    return this.core.fetch('/cvio/unidade', 'post', body, metadata);
  }

  /**
   * Esta Api retorna os dados de uma Unidade
   *
   * @summary Retorna unidade.
   * @throws FetchError<400, types.RetornarEmpreendimentoPorUnidadeResponse400> Erro ao tentar retornar unidade.
   */
  retornarEmpreendimentoPorUnidade(metadata: types.RetornarEmpreendimentoPorUnidadeMetadataParam): Promise<FetchResponse<200, types.RetornarEmpreendimentoPorUnidadeResponse200>> {
    return this.core.fetch('/v1/cv/unidade/{idempreendimento}/{id}', 'get', metadata);
  }

  /**
   * Unidade é um imóvel do empreendimento. Quando essa interface for consumida irá mudar a
   * situação da unidade, seja para bloqueada temporariamente ou para disponivel.
   *
   * **Obs: Para que essas informações sejam inseridas no CV, os identificadores da etapa e
   * do empreendimento devem existir no sistema.**
   *
   * @summary Bloqueia ou disponibiliza unidade.
   * @throws FetchError<400, types.BloquearUnidadeResponse400> Requisição de bloqueio de unidade incorreta!
   * @throws FetchError<422, types.BloquearUnidadeResponse422> Erro ao tentar bloquear/disponibilizar unidade.
   */
  bloquearUnidade(body: types.BloquearUnidadeBodyParam, metadata: types.BloquearUnidadeMetadataParam): Promise<FetchResponse<200, types.BloquearUnidadeResponse200>> {
    return this.core.fetch('/cvio/bloquear_unidade', 'post', body, metadata);
  }

  /**
   * Esta API é responsável por retornar todos os motivos de bloqueios de unidade cadastradas
   * no CV, podendo filtrar pelo idmotivo ou nome.
   *
   * @summary Retorna motivos de bloqueio de unidade.
   * @throws FetchError<400, types.RetornarMotivosBloqueioUnidadeResponse400> Erro ao retornar motivos de bloqueio de unidade
   */
  retornarMotivosBloqueioUnidade(metadata: types.RetornarMotivosBloqueioUnidadeMetadataParam): Promise<FetchResponse<200, types.RetornarMotivosBloqueioUnidadeResponse200>> {
    return this.core.fetch('/v1/cv/motivos_bloqueio_unidade', 'get', metadata);
  }

  /**
   * Filtro se o campo é obrigatório, se informado trará somente os obrigatórios ou não
   * obrigatórios (S|N)
   *
   * @summary Retorna campos obrigatórios.
   * @throws FetchError<400, types.CamposObrigatoriosSchemaResponse400> Requisição de campos obrigatórios incorreta!
   * @throws FetchError<422, types.CamposObrigatoriosSchemaResponse422> Erro ao retornar campos obrigatórios.
   */
  camposObrigatoriosSchema(body: types.CamposObrigatoriosSchemaBodyParam, metadata: types.CamposObrigatoriosSchemaMetadataParam): Promise<FetchResponse<200, types.CamposObrigatoriosSchemaResponse200>> {
    return this.core.fetch('/v1/cv/empreendimentos/campos_obrigatorios', 'get', body, metadata);
  }

  /**
   * Esse endpoint retorna os dados do ERP Sienge no empreendimento informado.
   *
   * @summary Retorna dados ERP Sienge do empreendimento.
   * @throws FetchError<400, types.RetornarErpSiengePorEmpreendimentoResponse400> ERP incorreto ou não suportado
   * @throws FetchError<401, types.RetornarErpSiengePorEmpreendimentoResponse401> E-mail e/ou token incorreto(s).
   * @throws FetchError<404, types.RetornarErpSiengePorEmpreendimentoResponse404> Não foram encontrados dados da integração para o empreendimento informado.
   */
  retornarErpSiengePorEmpreendimento(metadata: types.RetornarErpSiengePorEmpreendimentoMetadataParam): Promise<FetchResponse<200, types.RetornarErpSiengePorEmpreendimentoResponse200>> {
    return this.core.fetch('/v1/cv/empreendimentos/{idEmpreendimento}/erp/sienge', 'get', metadata);
  }

  /**
   * Atualiza a referência externa do empreendimento informado.
   *
   * @summary Atualiza referência externa.
   * @throws FetchError<400, types.EditarEmpreendimentoResponse400> Requisição de atualização de referência externa incorreta!
   * @throws FetchError<404, types.EditarEmpreendimentoResponse404> Empreendimento não encontrado
   * @throws FetchError<500, types.EditarEmpreendimentoResponse500> Erro interno
   */
  editarEmpreendimento(body: types.EditarEmpreendimentoBodyParam, metadata: types.EditarEmpreendimentoMetadataParam): Promise<FetchResponse<200, types.EditarEmpreendimentoResponse200>> {
    return this.core.fetch('/v1/cv/empreendimentos/{idEmpreendimento}/referencia-externa', 'put', body, metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { BloquearUnidadeBodyParam, BloquearUnidadeMetadataParam, BloquearUnidadeResponse200, BloquearUnidadeResponse400, BloquearUnidadeResponse422, CadastrarEmpreendimentoBodyParam, CadastrarEmpreendimentoMetadataParam, CadastrarEmpreendimentoResponse200, CadastrarEmpreendimentoResponse400, CadastrarEmpreendimentoResponse404, CadastroBlocoBodyParam, CadastroBlocoMetadataParam, CadastroBlocoResponse200, CadastroBlocoResponse400, CadastroBlocoResponse422, CadastroEtapaBodyParam, CadastroEtapaMetadataParam, CadastroEtapaResponse200, CadastroEtapaResponse400, CadastroEtapaResponse422, CadastroUnidadeBodyParam, CadastroUnidadeMetadataParam, CadastroUnidadeResponse200, CadastroUnidadeResponse400, CadastroUnidadeResponse422, CamposObrigatoriosSchemaBodyParam, CamposObrigatoriosSchemaMetadataParam, CamposObrigatoriosSchemaResponse200, CamposObrigatoriosSchemaResponse400, CamposObrigatoriosSchemaResponse422, EditarEmpreendimentoBodyParam, EditarEmpreendimentoMetadataParam, EditarEmpreendimentoResponse200, EditarEmpreendimentoResponse400, EditarEmpreendimentoResponse404, EditarEmpreendimentoResponse500, RetornarEmpreendimentoMetadataParam, RetornarEmpreendimentoPorUnidadeMetadataParam, RetornarEmpreendimentoPorUnidadeResponse200, RetornarEmpreendimentoPorUnidadeResponse400, RetornarEmpreendimentoResponse200, RetornarEmpreendimentoResponse422, RetornarEmpreendimentosMetadataParam, RetornarEmpreendimentosResponse200, RetornarEmpreendimentosResponse422, RetornarErpSiengePorEmpreendimentoMetadataParam, RetornarErpSiengePorEmpreendimentoResponse200, RetornarErpSiengePorEmpreendimentoResponse400, RetornarErpSiengePorEmpreendimentoResponse401, RetornarErpSiengePorEmpreendimentoResponse404, RetornarMotivosBloqueioUnidadeMetadataParam, RetornarMotivosBloqueioUnidadeResponse200, RetornarMotivosBloqueioUnidadeResponse400 } from './types';
