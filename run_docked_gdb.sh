#! /bin/bash
set -e

docker run -i -m=50m gdb /bin/bash /home/gdb_user/debug.sh
