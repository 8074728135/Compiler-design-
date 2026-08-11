#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main() {
    char s[100];
    printf("Enter expression: ");
    fgets(s, sizeof(s), stdin);

    for (int i = 0; s[i]; i++) {
        if (isspace(s[i])) continue;

        if (isalpha(s[i]) || s[i] == '_') {
            printf("Identifier: ");
            while (isalnum(s[i]) || s[i] == '_')
                printf("%c", s[i++]);
            printf("\n");
            i--;
        }
        else if (isdigit(s[i])) {
            printf("Constant: ");
            while (isdigit(s[i]))
                printf("%c", s[i++]);
            printf("\n");
            i--;
        }
        else if (strchr("+-*/", s[i])) {
            printf("Operator: %c\n", s[i]);
        }
    }
    return 0;
}