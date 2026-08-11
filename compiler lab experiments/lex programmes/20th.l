%{
#include <stdio.h>
%}

%%
[0-9]+(\.[0-9]+)?   { printf("Constant: %s\n", yytext); }
\"[^\"]*\"           { printf("String: %s\n", yytext); }
%%

int main() {
    yyin=fopen("sample.c","r");
    yylex();
}