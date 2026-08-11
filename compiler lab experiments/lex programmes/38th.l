%{
#include <stdio.h>
#include <string.h>

int max=0;
char longest[100];
%}

%%
[a-zA-Z]+ {
    if(strlen(yytext)>max) {
        max=strlen(yytext);
        strcpy(longest,yytext);
    }
}
.|\n ;
%%

int main() {
    yylex();

    printf("Longest word = %s\n",longest);
    printf("Length = %d\n",max);
}