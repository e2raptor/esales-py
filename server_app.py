import sys
from app import app
script, args = sys.argv[0], sys.argv[1:]
if not args:
    #Allows to be accessed from any ip
    app.run(host='0.0.0.0')
else:
    app.run(debug=True)
