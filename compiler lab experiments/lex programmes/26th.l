%{
#include <stdio.h>
%}

%%
[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,} {
    printf("Valid Email\n");
}
.* {
    printf("Invalid Email\n");
}
%%

int main() {
    yylex();
}