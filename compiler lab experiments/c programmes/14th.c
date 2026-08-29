#include <stdio.h>
#include <ctype.h>

int main() {
    char exp[100], op1, op2, op;
    int i = 0, temp = 1;

    printf("Enter expression: ");
    scanf("%s", exp);

    while (exp[i]) {
        if (isalnum(exp[i]) && exp[i+1] &&
            (exp[i+1] == '+' || exp[i+1] == '-' ||
             exp[i+1] == '*' || exp[i+1] == '/')) {

            op1 = exp[i];
            op = exp[i+1];
            op2 = exp[i+2];

            printf("t%d = %c %c %c\n", temp, op1, op, op2);
            exp[i+2] = '0' + temp;
            temp++;
            i += 2;
        }
        i++;
    }

    return 0;
}