#include <stdio.h>
#include <string.h>

int main() {
    char s[200];

    printf("Enter line: ");
    fgets(s, sizeof(s), stdin);

    if (strncmp(s, "//", 2) == 0 ||
        (strncmp(s, "/*", 2) == 0 &&
         strstr(s, "*/") != NULL))
        printf("It is a comment\n");
    else
        printf("It is not a comment\n");

    return 0;
}