/*
  ============================================================
  VCA Tech - Caixa de Chaves para Patinetes com Senha
  ============================================================

  Componentes:
  - ESP32 DevKit
  - Motor de Passo 28BYJ-48 + Driver ULN2003
  - Teclado Matricial 4x4 (16 teclas)
  - Buzzer Ativo (modulo 3 pinos)

  Ligacao do Motor de Passo (ULN2003 → ESP32):
    IN1 → GPIO 13
    IN3 → GPIO 27
    IN2 → GPIO 12
    IN4 → GPIO 25
    VCC → 5V externo (NAO use 3.3V do ESP32, corrente insuficiente)
    GND → GND compartilhado com ESP32

  Ligacao do Buzzer Ativo (modulo 3 pinos):
    Pino S → GPIO 14
    Pino +  → 3.3V ou 5V do ESP32
    Pino -  → GND do ESP32

  Ligacao do Teclado (pinos 1 a 10, esq→dir):
    Pino 1 (LED-)  → GND
    Pino 2 (C1)    → GPIO 19
    Pino 3 (C2)    → GPIO 18
    Pino 4 (C3)    → GPIO  5
    Pino 5 (C4)    → GPIO 22
    Pino 6 (L1)    → GPIO 23
    Pino 7 (L2)    → GPIO  4
    Pino 8 (L3)    → GPIO 26
    Pino 9 (L4)    → GPIO 15
    Pino 10 (LED+) → 3.3V (opcional, acende backlight)

  Senhas hardcoded de teste (nao geradas pelo app):
    8001 → vca001 (posicao 1)
    8002 → vca002 (posicao 2)
    8003 → vca003 (posicao 3)
    8004 → vca004 (posicao 4)
    8005 → vca005 (posicao 5)

  Bibliotecas necessarias (instale via Arduino IDE > Gerenciar Bibliotecas):
  - Firebase ESP32 Client (by mobizt)
  - Keypad (by Mark Stanley, Alexander Brevig)

  ============================================================
*/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/RTDBHelper.h>
#include <Keypad.h>
#include <Stepper.h>

// ============================================================
// CONFIGURACOES - ALTERE AQUI
// ============================================================

#define WIFI_SSID     "iPhone de Silas"
#define WIFI_PASSWORD "12345678"

#define FIREBASE_DATABASE_URL    "https://reserva-patinete-vca-default-rtdb.firebaseio.com"
#define FIREBASE_DATABASE_SECRET "pXo0gMT3Oc7RQSZVItgs2TcbUe4hVCaQkrcn5oU9"

// ============================================================
// MOTOR DE PASSO
// ============================================================

#define STEPS_PER_REV 2048

// IN1, IN3, IN2, IN4 — mesma ordem do calibrar_tambor.ino
Stepper drumStepper(STEPS_PER_REV, 13, 27, 12, 25);

// Posicoes calibradas em steps para cada lado do tambor.
// Posicao 0 = neutra/fechada. Posicoes 1-5 = chaves vca001-vca005.
// IMPORTANTE: ao ligar, o tambor deve estar fisicamente na posicao 0.
const int DRUM_POSITIONS[6] = {
  950,   // Posicao 0: neutra/fechada
  1320,  // Posicao 1: chave vca001
  1630,  // Posicao 2: chave vca002
  1930,  // Posicao 3: chave vca003
  610,   // Posicao 4: chave vca004
  100    // Posicao 5: chave vca005
};

// Tempo que o tambor fica aberto antes de voltar para posicao 0 (ms)
#define DRUM_OPEN_TIME 15000  // 15 segundos

// ============================================================
// BUZZER
// ============================================================

#define BUZZER_PIN 14

// ============================================================
// TECLADO MATRICIAL 4x4
// ============================================================

const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1', '4', '7', '*'},   // C1 (GPIO 19)
  {'2', '5', '8', '0'},   // C2 (GPIO 18)
  {'3', '6', '9', '#'},   // C3 (GPIO  5)
  {'A', 'B', 'C', 'D'}    // C4 (GPIO 22)
};

byte rowPins[ROWS] = {19, 18, 5, 22};   // C1, C2, C3, C4 do teclado
byte colPins[COLS] = {23, 4, 26, 15};   // L1, L2, L3, L4 do teclado

// ============================================================
// SENHAS HARDCODED DE TESTE
// ============================================================

// Estas senhas abrem diretamente o tambor sem consultar o Firebase.
// O app NUNCA gera essas senhas — sao exclusivas para testes fisicos.
const char* HARDCODED_CODES[]    = {"8001", "8002", "8003", "8004", "8005"};
const int   HARDCODED_POSITIONS[] = {1,      2,      3,      4,      5};
const char* HARDCODED_IDS[]      = {"vca001","vca002","vca003","vca004","vca005"};
const int   NUM_HARDCODED        = 5;

// ============================================================
// OBJETOS GLOBAIS
// ============================================================

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String inputCode   = "";
bool firebaseReady = false;
int  currentStep   = 0;  // rastreia posicao atual do motor em steps

const char* equipmentIds[] = {"vca001","vca002","vca003","vca004","vca005"};
const int   NUM_EQUIPMENTS = 5;

// ============================================================
// SETUP
// ============================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n=============================");
  Serial.println("VCA Tech - Caixa de Chaves");
  Serial.println("=============================\n");

  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Motor de passo — velocidade em RPM
  drumStepper.setSpeed(10);

  // Ao ligar, assume que o tambor esta fisicamente na posicao 0.
  // currentStep recebe o valor de steps da posicao 0 para que todos
  // os movimentos subsequentes sejam calculados corretamente.
  currentStep = DRUM_POSITIONS[0];
  Serial.println("Posicao inicial: 0 (neutra)");

  beepOk();  // 3 beeps de inicializacao

  connectWiFi();
  setupFirebase();

  Serial.println("Pronto. Aguardando senha...");
  Serial.println("# = confirmar | * = limpar");
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

void loop() {
  if (Firebase.ready()) {
    firebaseReady = true;
  }

  char key = keypad.getKey();

  if (key) {
    Serial.print("Tecla: ");
    Serial.println(key);

    if (key == '#') {
      if (inputCode.length() == 4) {
        beepClick();
        validateCode(inputCode);
      } else {
        beepError();
        Serial.println("Use 4 digitos + #");
        delay(2000);
        resetInput();
      }
    } else if (key == '*') {
      beepClick();
      resetInput();
    } else if (key >= '0' && key <= '9') {
      if (inputCode.length() < 4) {
        beepClick();
        inputCode += key;
        Serial.print("Entrada: ");
        for (unsigned int i = 0; i < inputCode.length(); i++) Serial.print("*");
        Serial.println();
      }
    }
    // A, B, C, D ignorados
  }
}

// ============================================================
// WIFI
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
    Serial.println("\nWiFi conectado! IP: " + WiFi.localIP().toString());
    delay(1500);
  } else {
    Serial.println("\nFalha WiFi!");
    delay(3000);
    ESP.restart();
  }
}

// ============================================================
// FIREBASE
// ============================================================

void setupFirebase() {
  Serial.println("Configurando Firebase...");

  config.database_url               = FIREBASE_DATABASE_URL;
  config.signer.tokens.legacy_token = FIREBASE_DATABASE_SECRET;

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);

  int attempts = 0;
  while (!Firebase.ready() && attempts < 20) {
    delay(500);
    attempts++;
  }

  if (Firebase.ready()) {
    Serial.println("Firebase conectado!");
    firebaseReady = true;
  } else {
    Serial.println("Falha Firebase!");
    delay(3000);
    ESP.restart();
  }
}

// ============================================================
// VALIDACAO DE SENHA
// ============================================================

void validateCode(String code) {
  Serial.print("Verificando: ");
  Serial.println(code);

  // --- Senhas hardcoded de teste (8001-8005) ---
  for (int i = 0; i < NUM_HARDCODED; i++) {
    if (code == HARDCODED_CODES[i]) {
      Serial.print("[TESTE] Senha hardcoded: ");
      Serial.println(HARDCODED_CODES[i]);
      beepSuccess();
      openDrum(HARDCODED_POSITIONS[i], HARDCODED_IDS[i]);
      resetInput();
      return;
    }
  }

  // --- Senhas do Firebase ---
  if (!firebaseReady) {
    Serial.println("Sem conexao Firebase.");
    beepError();
    delay(2000);
    resetInput();
    return;
  }

  for (int i = 0; i < NUM_EQUIPMENTS; i++) {
    String path = String("equipments/") + equipmentIds[i] + "/accessCode";

    if (Firebase.RTDB.getString(&fbdo, path.c_str())) {
      String storedCode = fbdo.stringData();

      if (storedCode.length() > 0 && storedCode == code) {
        Serial.print("Senha correta! Equipamento: ");
        Serial.println(equipmentIds[i]);

        beepSuccess();
        openDrum(i + 1, equipmentIds[i]);
        clearAccessCode(equipmentIds[i]);
        resetInput();
        return;
      }
    } else {
      Serial.print("Erro Firebase (");
      Serial.print(equipmentIds[i]);
      Serial.print("): ");
      Serial.println(fbdo.errorReason());
    }
  }

  Serial.println("Senha incorreta!");
  beepError();
  delay(2500);
  resetInput();
}

void clearAccessCode(const char* equipmentId) {
  String path = String("equipments/") + equipmentId + "/accessCode";

  if (!Firebase.RTDB.setString(&fbdo, path.c_str(), "")) {
    Serial.print("Erro ao limpar senha: ");
    Serial.println(fbdo.errorReason());
  }
}

// ============================================================
// CONTROLE DO TAMBOR (MOTOR DE PASSO)
// ============================================================

void moveToPosition(int position) {
  if (position < 0 || position > 5) {
    Serial.println("Posicao invalida!");
    return;
  }

  int targetStep  = DRUM_POSITIONS[position];
  int stepsToMove = targetStep - currentStep;

  Serial.print("Movendo para posicao ");
  Serial.print(position);
  Serial.print(" (");
  Serial.print(stepsToMove > 0 ? "+" : "");
  Serial.print(stepsToMove);
  Serial.println(" steps)");

  drumStepper.step(stepsToMove);
  currentStep = targetStep;
}

void openDrum(int position, const char* equipmentId) {
  Serial.print("Abrindo tambor — chave: ");
  Serial.println(equipmentId);

  moveToPosition(position);

  Serial.println("RETIRE A CHAVE!");

  unsigned long startTime = millis();
  while (millis() - startTime < DRUM_OPEN_TIME) {
    int secsLeft = (DRUM_OPEN_TIME - (millis() - startTime)) / 1000;
    Serial.print("Fechando em: ");
    Serial.print(secsLeft);
    Serial.println("s");
    if (secsLeft <= 5) {
      beepWarning();
    }
    delay(1000);
  }

  Serial.println("Fechando tambor...");
  moveToPosition(0);
  Serial.println("Tambor fechado. Aguardando senha...");
}

void resetInput() {
  inputCode = "";
  Serial.println("Aguardando senha...");
}

// ============================================================
// BUZZER
// ============================================================

void beepClick() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(30);
  digitalWrite(BUZZER_PIN, LOW);
}

void beepSuccess() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(120);
    digitalWrite(BUZZER_PIN, LOW);
    delay(80);
  }
}

void beepError() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(600);
  digitalWrite(BUZZER_PIN, LOW);
}

void beepWarning() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(80);
  digitalWrite(BUZZER_PIN, LOW);
}

void beepOk() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(80);
    digitalWrite(BUZZER_PIN, LOW);
    delay(80);
  }
}
