#include <stdio.h>
#include <ctype.h>

int stack[100], top = -1;

void push(int x) {
    stack[++top] = x;
}

int pop() {
    return stack[top--];
}

int main() {
    char exp[100];
    int a, b, result;

    printf("Enter postfix expression: ");
    scanf("%s", exp);

    for (int i = 0; exp[i] != '\0'; i++) {

        if (isdigit(exp[i])) {
            push(exp[i] - '0');
        }
        else {
            b = pop();
            a = pop();

            if (exp[i] == '+')
                result = a + b;
            else if (exp[i] == '-')
                result = a - b;
            else if (exp[i] == '*')
                result = a * b;
            else if (exp[i] == '/')
                result = a / b;

            push(result);
        }
    }

    printf("Result = %d", pop());

    return 0;
}