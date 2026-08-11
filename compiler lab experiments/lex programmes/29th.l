%{
#include <stdio.h>
%}

%%
int|char|float|double|void|return {
    printf("KEYWORD: %s\n",yytext);
}

[a-zA-Z_][a-zA-Z0-9_]* {
    printf("IDENTIFIER: %s\n",yytext);
}

[0-9]+ {
    printf("CONSTANT: %s\n",yytext);
}

"=="|"="|"+"|"-"|"*"|"/" {
    printf("OPERATOR: %s\n",yytext);
}

[(){};,] {
    printf("SPECIAL SYMBOL: %s\n",yytext);
}

[ \t\n]+ ;
. ;
%%

int main() {
    yyin=fopen("sample.c","r");
    yylex();
}