#include <stdio.h>

int divide(int a,int b)
{
    return a/b;
}

int main()
{
    int value=20;
    float num=15.5;
    int result;

    result=divide(10,2);

    if(result==5)
        printf("Result is 5\n");

    int x=10;
    int y=2;
    int z=x/y;

    int arr[4]={1,2,3,4};
    printf("%d\n",arr[3]);

    int data=25;
    int *ptr=&data;
    *ptr=25;

    int total=x+y*result;

    while(x<20)
    {
        printf("%d\n",x);
        x++;
    }

    return 0;
}