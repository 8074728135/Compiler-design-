%{
#include <stdio.h>
%}

%%
\<[^>]+\>    { printf("HTML Tag: %s\n", yytext); }
.|\n         ;
%%

int main() {
    yyin=fopen("sample.html","r");
    yylex();
}