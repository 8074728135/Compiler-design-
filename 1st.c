#include <stdio.h>

int sumArray(int arr[], int n)
{
    int i, sum = 0;

    for(i=0;i<n;i++)
        sum += arr[i];

    return sum;
}

int main()
{
    int arr[5]={1,2,3,4,5};
    int total;

    total=sumArray(arr,5);

    if(total==15)
        printf("Correct Sum\n");

    int a=10,b=2;
    int c=a/b;

    int value=20;
    int *p=&value;
    *p=20;

    printf("c=%d\n",c);

    return 0;
}