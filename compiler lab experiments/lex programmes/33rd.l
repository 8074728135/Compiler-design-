%{
#include <stdio.h>
%}

%%
https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,} {
    printf("Valid URL\n");
}
.* {
    printf("Invalid URL\n");
}
%%

int main() {
    yylex();
}