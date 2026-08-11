#include <stdio.h>

int main() {
    printf("Original Grammar:\n");
    printf("S -> iEtS | iEtSeS | a\n");
    printf("E -> b\n\n");

    printf("After Left Factoring:\n");
    printf("S  -> iEtS S' | a\n");
    printf("S' -> eS | ε\n");
    printf("E  -> b\n");

    return 0;
}