#include <stdio.h>

int main() {
    printf("Original Grammar:\n");
    printf("S -> (L) | a\n");
    printf("L -> L,S | S\n\n");

    printf("After removing left recursion:\n");
    printf("S  -> (L) | a\n");
    printf("L  -> S L'\n");
    printf("L' -> , S L' | ε\n");

    return 0;
}