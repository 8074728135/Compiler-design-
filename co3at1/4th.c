#include <stdio.h>
#include <string.h>

int main() {
    char type1[20], type2[20];

    printf("Enter first type: ");
    scanf("%s", type1);

    printf("Enter second type: ");
    scanf("%s", type2);

    if (strcmp(type1, type2) == 0)
        printf("Equivalent");
    else
        printf("Not Equivalent");

    return 0;
}