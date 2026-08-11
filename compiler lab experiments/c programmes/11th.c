#include <stdio.h>
#include <string.h>

struct Symbol {
    char name[20];
    char type[20];
};

struct Symbol table[50];
int n = 0;

void insert() {
    printf("Enter name and type: ");
    scanf("%s %s", table[n].name, table[n].type);
    n++;
}

void display() {
    printf("\nName\tType\n");
    for (int i = 0; i < n; i++)
        printf("%s\t%s\n", table[i].name, table[i].type);
}

int main() {
    int ch;

    while (1) {
        printf("\n1.Insert  2.Display  3.Exit\n");
        scanf("%d", &ch);

        if (ch == 1)
            insert();
        else if (ch == 2)
            display();
        else
            break;
    }

    return 0;
}