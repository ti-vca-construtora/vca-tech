/*
  ============================================================
  VCA Tech - Caixa de Chaves para Patinetes com Senha
  ============================================================
  
  Componentes:
  - ESP32 DevKit
  - Servo SG90 - 3 fios (marrom=GND, vermelho=5V, laranja=sinal)
  - Teclado Matricial 4x4 (16 teclas)
  - Buzzer Ativo
  - Fonte externa 5V para o servo (opcional para SG90, pode usar 3.3V do ESP32)

  Ligacao do Servo SG90:
    Marrom  (GND)   -> GND do ESP32
    Vermelho (VCC)  -> 3.3V ou 5V do ESP32 (SG90 aceita ambos)
    Laranja (Sinal) -> GPIO 13 do ESP32

  Ligacao do Buzzer Ativo (modulo 3 pinos):
    Pino S (+)  -> GPIO 14 do ESP32
    Pino +      -> 3.3V ou 5V do ESP32
    Pino -      -> GND do ESP32

  Bibliotecas necessarias (instale via Arduino IDE > Gerenciar Bibliotecas):
  - Firebase ESP32 Client (by mobizt)
  - Keypad (by Mark Stanley, Alexander Brevig)
  - ESP32Servo (by Kevin Harrington)
  
  Estrutura Firebase Realtime Database esperada:
  equipments/
    vca001/
      available: true/false
      currentUser: "userId"
      reservedUntil: "ISO date"
      accessCode: "1234"           <-- senha de 4 dígitos
    vca002/ ...
    
  ============================================================
*/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/RTDBHelper.h>
#include <Keypad.h>
#include <ESP32Servo.h>

// ============================================================
// CONFIGURAÇÕES - ALTERE AQUI
// ============================================================

// WiFi
#define WIFI_SSID "VCA"
#define WIFI_PASSWORD "vcaconstrutora"

// Firebase
#define FIREBASE_DATABASE_URL "https://reserva-patinete-vca-default-rtdb.firebaseio.com"
#define FIREBASE_DATABASE_SECRET "pXo0gMT3Oc7RQSZVItgs2TcbUe4hVCaQkrcn5oU9"  // veja instrucoes abaixo

// ============================================================
// PINOS E CONSTANTES
// ============================================================

// Servo Motor SG90
#define SERVO_PIN 13

// Buzzer Ativo
#define BUZZER_PIN 14

// Ângulos do servo para cada posição do tambor (6 lados)
// Ajuste esses valores conforme a mecânica do seu tambor
// Lado 0 = posição "neutra/fechada", Lados 1-5 = chaves dos patinetes vca001-vca005
const int DRUM_ANGLES[6] = {
  180,    // Posição 0: posição neutra/fechada (sem chave)
  115,   // Posição 1: chave vca001
  50,   // Posição 2: chave vca002
  0,  // Posição 3: chave vca003
  360,  // Posição 4: chave vca004
  360   // Posição 5: chave vca005
};

// Tempo que o tambor fica aberto (ms) antes de voltar à posição neutra
#define DRUM_OPEN_TIME 15000  // 15 segundos

// Teclado Matricial 4x4
const byte ROWS = 4;
const byte COLS = 4;

// Pinout fisico confirmado por teste de continuidade (pinos 1 a 10, esq→dir):
//   Pino 1 = LED-, Pino 2=C1, 3=C2, 4=C3, 5=C4, 6=L1, 7=L2, 8=L3, 9=L4, 10=LED+
//
// Ligacao ao ESP32:
//   Pino 2 (C1) → GPIO 19  |  Pino 6 (L1) → GPIO 23
//   Pino 3 (C2) → GPIO 18  |  Pino 7 (L2) → GPIO 4
//   Pino 4 (C3) → GPIO  5  |  Pino 8 (L3) → GPIO 26  ← era GPIO 2 (conflito com LED da placa)
//   Pino 5 (C4) → GPIO 22  |  Pino 9 (L4) → GPIO 15
//
// rowPins varrem C1→C4 (saida), colPins leem L1→L4 (entrada)
// keys[r][c] = tecla quando Cr baixo e Lc baixo
char keys[ROWS][COLS] = {
  //   L1    L2    L3    L4
  {'1', '4', '7', '*'},   // C1 (GPIO 19)
  {'2', '5', '8', '0'},   // C2 (GPIO 18)
  {'3', '6', '9', '#'},   // C3 (GPIO  5)
  {'A', 'B', 'C', 'D'}    // C4 (GPIO 22)
};

byte rowPins[ROWS] = {19, 18, 5, 22};   // C1, C2, C3, C4 do teclado
byte colPins[COLS] = {23, 4, 26, 15};   // L1, L2, L3, L4 do teclado

// ============================================================
// OBJETOS GLOBAIS
// ============================================================

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
Servo drumServo;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Estado
String inputCode = "";
bool firebaseReady = false;
unsigned long lastFirebaseCheck = 0;
const unsigned long FIREBASE_CHECK_INTERVAL = 5000; // Checar Firebase a cada 5s
int currentServoAngle = 0; // rastreia angulo atual do servo (nao usa read())

// Nomes dos equipamentos
const char* equipmentIds[] = {"vca001", "vca002", "vca003", "vca004", "vca005"};
const int NUM_EQUIPMENTS = 5;

// ============================================================
// SETUP
// ============================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n=============================");
  Serial.println("VCA Tech - Caixa de Chaves");
  Serial.println("=============================\n");

  Serial.println("Iniciando...");

  // Inicializa Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Inicializa Servo SG90 (attach simples, sem range customizado)
  drumServo.attach(SERVO_PIN);
  currentServoAngle = DRUM_ANGLES[0];
  drumServo.write(currentServoAngle); // Posicao neutra
  delay(500);

  beepOk(); // 3 beeps de inicializacao

  // Conecta WiFi
  connectWiFi();

  // Configura Firebase
  setupFirebase();

  Serial.println("Pronto. Aguardando senha...");
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

void loop() {
  // Mantém conexão Firebase ativa
  if (Firebase.ready()) {
    firebaseReady = true;
  }

  // Lê tecla pressionada
  char key = keypad.getKey();

  if (key) {
    Serial.print("Tecla: ");
    Serial.println(key);

    if (key == '#') {
      // # = Confirmar senha
      if (inputCode.length() == 4) {
        beepClick();
        validateCode(inputCode);
      } else {
        beepError();
        Serial.println("Senha invalida: use 4 digitos");
        delay(2000);
        resetInput();
      }
    } else if (key == '*') {
      // * = Limpar/Cancelar
      beepClick();
      resetInput();
    } else if (key >= '0' && key <= '9') {
      // Digito numerico
      if (inputCode.length() < 4) {
        beepClick();
        inputCode += key;
        Serial.print("Entrada: ");
        for (unsigned int i = 0; i < inputCode.length(); i++) Serial.print("*");
        Serial.println();
      }
    }
    // Teclas A, B, C, D sao ignoradas
  }
}

// ============================================================
// FUNÇÕES DE CONEXÃO
// ============================================================

void connectWiFi() {
  Serial.print("Conectando WiFi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    delay(1500);
  } else {
    Serial.println("\nFalha ao conectar WiFi!");
    delay(3000);
    ESP.restart();
  }
}

void setupFirebase() {
  Serial.println("Configurando Firebase...");

  // Autenticacao por Database Secret (legacy token) - mais simples para IoT
  // Nao requer Firebase Auth habilitado no console
  config.database_url = FIREBASE_DATABASE_URL;
  config.signer.tokens.legacy_token = FIREBASE_DATABASE_SECRET;

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);

  // Aguarda conexao
  int attempts = 0;
  while (!Firebase.ready() && attempts < 20) {
    delay(500);
    attempts++;
  }

  if (Firebase.ready()) {
    Serial.println("Firebase conectado!");
    delay(1000);
    firebaseReady = true;
  } else {
    Serial.println("Falha Firebase!");
    delay(3000);
    ESP.restart();
  }
}

// ============================================================
// VALIDAÇÃO DE SENHA
// ============================================================

void validateCode(String code) {

  Serial.print("Verificando senha: ");
  Serial.println(code);

  // =====================================================
  // 🔐 SENHAS HARDCODED DE EMERGÊNCIA (MANUAL)
  // =====================================================
  // 8001 -> vca001
  // 8002 -> vca002
  // 8003 -> vca003
  // 8004 -> vca004
  // 8005 -> vca005
  // =====================================================

  if (code == "8001") {
    Serial.println("[HARDCODE] Acesso manual vca001");
    beepSuccess();
    openDrum(1, "vca001");
    resetInput();
    return;
  }

  if (code == "8002") {
    Serial.println("[HARDCODE] Acesso manual vca002");
    beepSuccess();
    openDrum(2, "vca002");
    resetInput();
    return;
  }

  if (code == "8003") {
    Serial.println("[HARDCODE] Acesso manual vca003");
    beepSuccess();
    openDrum(3, "vca003");
    resetInput();
    return;
  }

  if (code == "8004") {
    Serial.println("[HARDCODE] Acesso manual vca004");
    beepSuccess();
    openDrum(4, "vca004");
    resetInput();
    return;
  }

  if (code == "8005") {
    Serial.println("[HARDCODE] Acesso manual vca005");
    beepSuccess();
    openDrum(5, "vca005");
    resetInput();
    return;
  }

  // =====================================================
  // 🔵 SE NÃO FOR HARDCODE, VERIFICA NO FIREBASE
  // =====================================================

  if (!firebaseReady) {
    Serial.println("Sem conexao Firebase. Aguarde...");
    beepError();
    delay(2000);
    resetInput();
    return;
  }

  for (int i = 0; i < NUM_EQUIPMENTS; i++) {
    String path = String("equipments/") + equipmentIds[i] + "/accessCode";

    if (Firebase.RTDB.getString(&fbdo, path.c_str())) {

      String storedCode = fbdo.stringData();

      if (storedCode == code) {
        Serial.print("Senha correta via Firebase! Equipamento: ");
        Serial.println(equipmentIds[i]);

        beepSuccess();

        int drumPosition = i + 1;
        openDrum(drumPosition, equipmentIds[i]);

        // Limpa a senha no Firebase após uso
        clearAccessCode(equipmentIds[i]);

        resetInput();
        return;
      }

    } else {
      Serial.print("Erro ao ler ");
      Serial.print(equipmentIds[i]);
      Serial.print(": ");
      Serial.println(fbdo.errorReason());
    }
  }

  // Nenhuma senha encontrada
  Serial.println("Senha incorreta!");
  beepError();
  delay(2500);
  resetInput();
}
void clearAccessCode(const char* equipmentId) {
  String path = String("equipments/") + equipmentId + "/accessCode";

  if (Firebase.RTDB.setString(&fbdo, path.c_str(), "")) {
    Serial.print("Senha limpa para: ");
    Serial.println(equipmentId);
  } else {
    Serial.print("Erro ao limpar senha: ");
    Serial.println(fbdo.errorReason());
  }
}

// ============================================================
// CONTROLE DO TAMBOR (SERVO)
// ============================================================

void openDrum(int position, const char* equipmentId) {
  if (position < 1 || position > 5) {
    Serial.println("Posicao invalida do tambor!");
    return;
  }

  int angle = DRUM_ANGLES[position];

  Serial.print("Abrindo tambor - Chave: ");
  Serial.println(String(equipmentId).substring(3));
  Serial.print("Girando tambor para posicao ");
  Serial.print(position);
  Serial.print(" (angulo: ");
  Serial.print(angle);
  Serial.println(")");

  // Gira o servo suavemente ate a posicao (usa variavel global, nao drumServo.read())
  if (currentServoAngle < angle) {
    for (int a = currentServoAngle; a <= angle; a++) {
      drumServo.write(a);
      delay(15);
    }
  } else {
    for (int a = currentServoAngle; a >= angle; a--) {
      drumServo.write(a);
      delay(15);
    }
  }
  currentServoAngle = angle;

  Serial.println("RETIRE A CHAVE!");

  // Countdown
  int secondsRemaining = DRUM_OPEN_TIME / 1000;
  unsigned long startTime = millis();

  while (millis() - startTime < DRUM_OPEN_TIME) {
    secondsRemaining = (DRUM_OPEN_TIME - (millis() - startTime)) / 1000;
    Serial.print("Fechando em: ");
    Serial.print(secondsRemaining);
    Serial.println("s");
    // Beep de aviso nos ultimos 5 segundos
    if (secondsRemaining <= 5) {
      beepWarning();
    }
    delay(1000);
  }

  // Volta o tambor para a posicao neutra
  Serial.println("Fechando tambor...");

  int neutralAngle = DRUM_ANGLES[0];
  if (currentServoAngle < neutralAngle) {
    for (int a = currentServoAngle; a <= neutralAngle; a++) {
      drumServo.write(a);
      delay(15);
    }
  } else {
    for (int a = currentServoAngle; a >= neutralAngle; a--) {
      drumServo.write(a);
      delay(15);
    }
  }
  currentServoAngle = neutralAngle;

  Serial.println("Tambor fechado. Aguardando senha...");
}

void resetInput() {
  inputCode = "";
  Serial.println("Aguardando senha...");
}

// ============================================================
// BUZZER
// ============================================================

// Beep curto - pressionamento de tecla
void beepClick() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(30);
  digitalWrite(BUZZER_PIN, LOW);
}

// Dois beeps rapidos - sucesso / senha correta
void beepSuccess() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(120);
    digitalWrite(BUZZER_PIN, LOW);
    delay(80);
  }
}

// Beep longo - erro / senha errada
void beepError() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(600);
  digitalWrite(BUZZER_PIN, LOW);
}

// Beep curto de aviso - contagem regressiva
void beepWarning() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(80);
  digitalWrite(BUZZER_PIN, LOW);
}

// Tres beeps - inicializacao
void beepOk() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(80);
    digitalWrite(BUZZER_PIN, LOW);
    delay(80);
  }
}

// ============================================================
// RECONEXÃO WIFI (chamada no loop se necessário)
// ============================================================

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado! Reconectando...");
    WiFi.reconnect();
    delay(5000);

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("WiFi reconectado!");
    }
  }
}
