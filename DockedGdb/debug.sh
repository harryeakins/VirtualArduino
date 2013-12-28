#! /bin/bash

cd /home/gdb_user

rm -f prog.c

while read line ; do
	echo "line = $line"
	if [ "$line" = "END_OF_ARDUINO_FILE" ] ; then break ; fi
	echo $line >> prog.c
done

g++ -g prog.c -o prog

if [ "$?" -eq "0" ] 
then
  echo "NOW_IN_GDB"
  gdb --interpreter=mi2 prog
fi
