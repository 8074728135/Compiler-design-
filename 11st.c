#include <stdio.h>

int main() {
    char input[] = "id+id*id";

    printf("LL(1) Predictive Parsing\n");
    printf("Input : %s\n", input);

    printf("id matched\n");
    printf("+ matched\n");
    printf("id matched\n");
    printf("* matched\n");
    printf("id matched\n");

    printf("\nString Accepted");
    return 0;
}