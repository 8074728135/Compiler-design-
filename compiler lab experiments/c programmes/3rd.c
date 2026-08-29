#include <stdio.h>

int main() {
    char s[500];
    int i = 0;

    printf("Enter input:\n");
    fgets(s, sizeof(s), stdin);

    while (s[i]) {
        if (s[i] == ' ' || s[i] == '\t' || s[i] == '\n') {
            i++;
        }
        else if (s[i] == '/' && s[i+1] == '/') {
            break;
        }
        else if (s[i] == '/' && s[i+1] == '*') {
            i += 2;
            while (s[i] && !(s[i] == '*' && s[i+1] == '/'))
                i++;
            i += 2;
        }
        else {
            printf("%c", s[i++]);
        }
    }

    return 0;
}