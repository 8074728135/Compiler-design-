#include <stdio.h>

int main() {
    int a, b, c;
    int result;

    printf("Enter values of a, b and c: ");
    scanf("%d %d %d", &a, &b, &c);

    result = a + (b * c);

    printf("Result = %d", result);

    return 0;
}