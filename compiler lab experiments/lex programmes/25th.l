%{
#include <stdio.h>
%}

%%
[A-Z]+    { printf("Capital word: %s\n", yytext); }
.|\n      ;
%%

int main() {
    yylex();
}