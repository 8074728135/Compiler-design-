%{
#include <stdio.h>
int positive=0, negative=0;
%}

%%
-[0-9]+    { negative++; }
[0-9]+     { positive++; }
.|\n       ;
%%

int main() {
    yylex();

    printf("Positive = %d\n",positive);
    printf("Negative = %d\n",negative);
}