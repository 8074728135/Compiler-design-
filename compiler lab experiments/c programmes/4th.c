#include <stdio.h>

int main() {
    char ch;

    printf("Enter operator: ");
    scanf("%c", &ch);

    if (ch == '+' || ch == '-' || ch == '*' || ch == '/')
        printf("Valid arithmetic operator\n");
    else
        printf("Invalid operator\n");

    return 0;
}