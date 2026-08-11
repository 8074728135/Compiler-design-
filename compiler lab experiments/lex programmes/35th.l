%{
#include <stdio.h>
%}

%%
[0-9]   { printf("It is a digit\n"); }
.       { printf("It is not a digit\n"); }
%%

int main() {
    yylex();
}