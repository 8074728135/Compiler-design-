#include <stdio.h>
#include <string.h>

int main() {
    char type1[20], type2[20], op;

    printf("Enter first type: ");
    scanf("%s", type1);

    printf("Enter operator: ");
    scanf(" %c", &op);

    printf("Enter second type: ");
    scanf("%s", type2);

    if ((strcmp(type1, "int") == 0 ||
         strcmp(type1, "float") == 0) &&
        (strcmp(type2, "int") == 0 ||
         strcmp(type2, "float") == 0)) {

        printf("Valid expression");
    }
    else {
        printf("Type error");
    }

    return 0;
}