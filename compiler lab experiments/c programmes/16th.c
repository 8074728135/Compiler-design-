#include <stdio.h>

int main() {
    char op1, op2, op;
    
    printf("Enter three address statement: ");
    scanf("%c = %c %c %c", &op1, &op1, &op2, &op);

    printf("MOV R0, operand1\n");
    printf("MOV R1, operand2\n");
    printf("ADD R0, R1\n");
    printf("MOV result, R0\n");

    return 0;
}