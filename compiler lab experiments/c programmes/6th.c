#include <stdio.h>
#include <ctype.h>

int main() {
    char s[50];
    int valid = 1;

    printf("Enter identifier: ");
    scanf("%s", s);

    if (!isalpha(s[0]) && s[0] != '_')
        valid = 0;

    for (int i = 1; s[i]; i++) {
        if (!isalnum(s[i]) && s[i] != '_') {
            valid = 0;
            break;
        }
    }

    if (valid)
        printf("Valid identifier\n");
    else
        printf("Invalid identifier\n");

    return 0;
}