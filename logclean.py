import jsbeautifier
opts = jsbeautifier.default_options()
opts.indent_size = 2
opts.indent_char = '	'
opts.eol = '\n'
opts.end_with_newline = 'true'
res = jsbeautifier.beautify_file('logs/Commandlog.json', opts)
f = open('log.json','w')
f.write(res)
f.close()
exit()