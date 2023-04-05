#!/bin/bash
php artisan dusk --colors --debug
exitcode=${PIPESTATUS[0]}

screenshots=(`find ./tests/Browser/screenshots/ -maxdepth 1 -name "*.png"`)
console=(`find ./tests/Browser/console/ -maxdepth 1 -name "*.log"`)

echo "Checking for logs..."
if [ ${#console[@]} -gt 0 ]; then
    for filename in ./tests/Browser/console/*.log; do
        file_str=${filename#*console/}
        echo ""
        echo $file_str
        cat $filename
        echo ""
    done
else
    echo "no logs found"
fi

echo "Checking for screenshots..."
if [ ${#screenshots[@]} -gt 0 ]; then
    for filename in ./tests/Browser/screenshots/*.png; do
        file_str=${filename#*screenshots/}
        curl -s -H "Max-Days: 1" --upload-file "$filename" "https://transfer.sh/$file_str"
        echo ""
    done
else
    echo "no screenshots found"
fi

exit $exitcode
