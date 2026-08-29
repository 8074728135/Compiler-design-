%{
#include <stdio.h>
%}

%%
abc     { printf("ABC"); }
.|\n    { printf("%s",yytext); }
%%

int main() {
    yylex();
}