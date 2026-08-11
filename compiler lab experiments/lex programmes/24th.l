%{
#include <stdio.h>
int comments=0;
FILE *out;
%}

%%
"//".*              { comments++; }
"/*"([^*]|\*+[^*/])*\*+"/" { comments++; }
\n                  { fprintf(out,"\n"); }
.                   { fprintf(out,"%s",yytext); }
%%

int main() {
    yyin=fopen("input.c","r");
    out=fopen("output.c","w");

    yylex();

    printf("Comment lines = %d\n",comments);

    fclose(out);
}