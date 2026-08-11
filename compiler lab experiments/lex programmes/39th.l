%{
#include <stdio.h>
#include <string.h>

char old[50], newword[50];
%}

%%
[a-zA-Z]+ {
    if(strcmp(yytext,old)==0)
        printf("%s",newword);
    else
        printf("%s",yytext);
}
.|\n {
    printf("%s",yytext);
}
%%

int main() {
    printf("Enter old word: ");
    scanf("%s",old);

    printf("Enter new word: ");
    scanf("%s",newword);

    yyin=fopen("input.txt","r");
    yylex();
}