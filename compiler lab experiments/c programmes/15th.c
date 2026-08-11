#include <stdio.h>
#include <ctype.h>

int main() {
    FILE *fp;
    char ch;
    int characters = 0, words = 0, lines = 0;
    int inword = 0;

    fp = fopen("input.txt", "r");

    if (fp == NULL) {
        printf("File not found\n");
        return 0;
    }

    while ((ch = fgetc(fp)) != EOF) {
        characters++;

        if (ch == '\n')
            lines++;

        if (isspace(ch))
            inword = 0;
        else if (!inword) {
            words++;
            inword = 1;
        }
    }

    fclose(fp);

    printf("Characters = %d\n", characters);
    printf("Words = %d\n", words);
    printf("Lines = %d\n", lines);

    return 0;
}