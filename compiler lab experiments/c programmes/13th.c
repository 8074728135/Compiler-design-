#include <stdio.h>
#include <string.h>

char s[100];
int i = 0;

int S() {
    if (s[i] == 'a') {
        i++;
        if (!S()) return 0;

        if (s[i] == 'b') {
            i++;
            return 1;
        }
        return 0;
    }

    return 1;
}

int main() {
    printf("Enter string: ");
    scanf("%s", s);

    if (S() && s[i] == '\0')
        printf("String accepted\n");
    else
        printf("String rejected\n");

    return 0;
}