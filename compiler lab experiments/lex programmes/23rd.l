%{
#include <stdio.h>
int line=1;
%}

%%
^.*\n {
    printf("%d: %s", line++, yytext);
}
.* {
    printf("%d: %s\n", line++, yytext);
}
%%

int main() {
    yyin=fopen("sample.c","r");
    yylex();
}