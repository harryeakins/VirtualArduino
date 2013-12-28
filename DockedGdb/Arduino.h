#include <stdio.h>
#define HIGH 1
#define LOW 0
#define INPUT 1
#define OUTPUT 0

int pinOutputs[14] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0};
int pinStates[14] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0};
int pinVoltages[14] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0};

class Serial_t {
public:
	void begin(int speed) {
		// Do nothing
	}
  void println(int num) {
			printf("%%%d\n", num);
			fflush(stdout);
	}
  void println(const char *str) {
			printf("%%%s\n", str);
			fflush(stdout);
	}
	void println(char ch) {
			printf("%%%c\n", ch);
			fflush(stdout);
	}
  void print(int num) {
			printf("%%%d", num);
			fflush(stdout);
	}
  void print(const char *str) {
			printf("%%%s", str);
			fflush(stdout);
	}
	void print(char ch) {
			printf("%%%c", ch);
			fflush(stdout);
	}
};

Serial_t Serial;

void digitalWrite(int pin, int state) {
		if(pin >= 0 && pin <= 13 && state >= 0 && state <= 1) {
			pinOutputs[pin] = state;
			pinVoltages[pin] = (pinOutputs[pin] && ~pinStates[pin]) ? 1 : 0;
		}
}

int digitalRead(int pin) {
    if(pin >= 0 && pin <= 13) {
				return pinVoltages[pin];
		}
		return 0;
}

void pinMode(int pin, int state) {
		if(pin >= 0 && pin <= 13 && state >= 0 && state <= 1) {
			pinStates[pin] = state;	
			pinVoltages[pin] = (pinOutputs[pin] && ~pinStates[pin]) ? 1 : 0;
		}

}

void delay(int ms) {

}
