#include <stdio.h>
#include <ctype.h>

int main() {
    char s[200];
    int count = 0;

    printf("Enter sentence: ");
    fgets(s, sizeof(s), stdin);

    for (int i = 0; s[i]; i++) {
        char c = tolower(s[i]);

        if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u')
            count++;
    }

    printf("Vowels = %d\n", count);

    return 0;
}