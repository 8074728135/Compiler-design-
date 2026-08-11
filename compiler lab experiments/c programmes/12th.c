#include <stdio.h>
#include <string.h>

char input[100];
int i = 0;

void E();
void T();
void F();

void Eprime() {
    if (input[i] == '+') {
        i++;
        T();
        Eprime();
    }
}

void T() {
    F();

    while (input[i] == '*') {
        i++;
        F();
    }
}

void F() {
    if (input[i] == 'i' && input[i+1] == 'd')
        i += 2;
    else if (input[i] == '(') {
        i++;
        E();
        if (input[i] == ')')
            i++;
        else {
            printf("Invalid\n");
            return;
        }
    }
    else {
        printf("Invalid\n");
    }
}

void E() {
    T();
    Eprime();
}

int main() {
    printf("Enter expression using id: ");
    scanf("%s", input);

    E();

    if (input[i] == '\0')
        printf("Valid expression\n");
    else
        printf("Invalid expression\n");

    return 0;
}