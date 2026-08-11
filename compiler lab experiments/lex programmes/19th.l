%{
#include <stdio.h>
int chars=0, words=0, lines=0;
%}

%%
\n          { lines++; chars++; }
[ \t]+      { chars += yyleng; }
[a-zA-Z0-9]+ { words++; chars += yyleng; }
.           { chars++; }
%%

int main() {
    yyin = fopen("sample.c","r");
    yylex();

    printf("Characters = %d\n",chars);
    printf("Words = %d\n",words);
    printf("Lines = %d\n",lines);
}