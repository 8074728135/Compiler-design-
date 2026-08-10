#include <stdio.h>

int main() {
    int a, b, result;
    char op;

    printf("Enter expression (a op b): ");
    scanf("%d %c %d", &a, &op, &b);

    if (op == '+')
        result = a + b;
    else if (op == '-')
        result = a - b;
    else if (op == '*')
        result = a * b;
    else if (op == '/')
        result = a / b;
    else {
        printf("Invalid operator");
        return 0;
    }

    printf("Result = %d", result);

    return 0;
}