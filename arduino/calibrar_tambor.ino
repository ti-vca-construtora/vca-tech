#include <Keypad.h>
#include <Stepper.h>

// ============================
// CONFIG MOTOR
// ============================

#define STEPS_PER_REV 2048

// IN1, IN3, IN2, IN4
Stepper drumStepper(STEPS_PER_REV, 13, 27, 12, 25);

// ============================
// POSIÇÕES DO TAMBOR
// ============================
// 6 lados = 360 / 6 = 60 graus

const int POSITIONS[6] = {
  950,
  1320,
  1630,
  1930,
  610,
  100
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

// ============================
// VARIÁVEIS
// ============================

String input = "";

int currentStep = 0;

unsigned long moveTime = 0;

bool waitingReturn = false;

// ============================
// SETUP
// ============================

void setup() {

  Serial.begin(115200);

  Serial.println("Sistema iniciado");
  Serial.println("Posicao inicial: 0");

  drumStepper.setSpeed(10);  // RPM

}

// ============================
// LOOP
// ============================

void loop() {

  char key = keypad.getKey();

  if (key) {

    Serial.print("Tecla: ");
    Serial.println(key);

    if (key == '#') {

      if (input.length() == 1) {

        int pos = input.toInt();

        moveToPosition(pos);
      }

      input = "";
    }

    else if (key >= '0' && key <= '5') {

      input = key;

      Serial.print("Selecionado: ");
      Serial.println(input);
    }
  }

  // retorno automático

  if (waitingReturn && millis() - moveTime >= RETURN_TIME) {

    Serial.println("Voltando para posição 0");

    moveToPosition(0);

    waitingReturn = false;
  }
}

// ============================
// MOVIMENTO
// ============================

void moveToPosition(int position) {

  if (position < 0 || position > 5) {

    Serial.println("Posição inválida");

    return;
  }

  int targetStep = POSITIONS[position];

  int stepsToMove = targetStep - currentStep;

  Serial.print("Movendo para posição ");
  Serial.println(position);

  drumStepper.step(stepsToMove);

  currentStep = targetStep;

  Serial.print("Passo atual: ");
  Serial.println(currentStep);

  if (position != 0) {

    moveTime = millis();

    waitingReturn = true;
  }
  else {

    waitingReturn = false;
  }
}