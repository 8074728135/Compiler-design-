%{
#include <stdio.h>
%}

%%
[0-9]+[+][0-9]+ {
    printf("Addition operation\n");
}
[0-9]+[-][0-9]+ {
    printf("Subtraction operation\n");
}
[0-9]+[*][0-9]+ {
    printf("Multiplication operation\n");
}
[0-9]+[/][0-9]+ {
    printf("Division operation\n");
}
.* {
    printf("Invalid operation\n");
}
%%

int main() {
    yylex();
}