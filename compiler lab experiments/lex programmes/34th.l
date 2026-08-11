%{
#include <stdio.h>
%}

%%
(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-[0-9]{4} {
    printf("Valid DOB format\n");
}
.* {
    printf("Invalid DOB\n");
}
%%

int main() {
    yylex();
}