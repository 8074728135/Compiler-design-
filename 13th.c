#include <stdio.h>

int main() {
    printf("Input : a=b+c*d\n\n");

    printf("Tokens:\n");
    printf("id = id + id * id\n\n");

    printf("Three Address Code:\n");
    printf("t1 = c * d\n");
    printf("t2 = b + t1\n");
    printf("a = t2\n");

    return 0;
}