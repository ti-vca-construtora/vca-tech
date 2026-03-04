#include <Keypad.h>
#include <ESP32Servo.h>

// ============================
// PINOS
// ============================

#define SERVO_PIN 13

// ============================
// AJUSTE OS ÂNGULOS AQUI
// ============================

const int DRUM_ANGLES[6] = {
  180,    // 0 - Neutro
  115,   // 1
  50,   // 2
  0,  // 3
  360,  // 4
  360   // 5
};

#define RETURN_TIME 10000  // 10 segundos

// ============================
// TECLADO
// ============================

const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1', '4', '7', '*'},
  {'2', '5', '8', '0'},
  {'3', '6', '9', '#'},
  {'A', 'B', 'C', 'D'}
};

byte rowPins[ROWS] = {19, 18, 5, 22};
byte colPins[COLS] = {23, 4, 26, 15};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
Servo drumServo;

String input = "";
int currentAngle = 0;
unsigned long moveTime = 0;
bool waitingReturn = false;

// ============================
// SETUP
// ============================

void setup() {
  Serial.begin(115200);
  Serial.println("Modo simples de calibracao");

  drumServo.attach(SERVO_PIN);

  currentAngle = DRUM_ANGLES[0];
  drumServo.write(currentAngle);

  Serial.println("Iniciado na posicao 0");
}

// ============================
// LOOP
// ============================

void loop() {

  char key = keypad.getKey();

  if (key) {

    if (key == '#') {
      if (input.length() == 1) {
        int pos = input.toInt();
        moveToPosition(pos);
      }
      input = "";
    }

    else if (key >= '0' && key <= '5') {
      input = key;  // aceita apenas 1 dígito
      Serial.print("Selecionado: ");
      Serial.println(input);
    }
  }

  // Verifica se precisa voltar para 0
  if (waitingReturn && millis() - moveTime >= RETURN_TIME) {
    Serial.println("Voltando para posicao 0...");
    moveServoSmooth(DRUM_ANGLES[0]);
    waitingReturn = false;
  }
}

// ============================
// MOVE PARA POSIÇÃO
// ============================

void moveToPosition(int position) {

  if (position < 0 || position > 5) {
    Serial.println("Posicao invalida");
    return;
  }

  Serial.print("Indo para posicao ");
  Serial.println(position);

  moveServoSmooth(DRUM_ANGLES[position]);

  if (position != 0) {
    moveTime = millis();
    waitingReturn = true;
  } else {
    waitingReturn = false;
  }
}

// ============================
// MOVIMENTO SUAVE
// ============================

void moveServoSmooth(int targetAngle) {

  if (currentAngle < targetAngle) {
    for (int a = currentAngle; a <= targetAngle; a++) {
      drumServo.write(a);
      delay(15);
    }
  } else {
    for (int a = currentAngle; a >= targetAngle; a--) {
      drumServo.write(a);
      delay(15);
    }
  }

  currentAngle = targetAngle;

  Serial.print("Angulo atual: ");
  Serial.println(currentAngle);
}