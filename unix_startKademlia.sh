for i in {8888..8892}
do
j=8888
q=$((i-1))

if [ $i == $j ]
then
   node Index.js $i 0 & sleep 1 &
else
   node Index.js $i $q & sleep 1 &
fi
done
