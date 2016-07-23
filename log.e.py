import jsbeautifier
opts = jsbeautifier.default_options()
opts.indent_size = 1
opts.indent_char = '	'
opts.eol = '\n'
opts.end_with_newline = 'true'
res = jsbeautifier.beautify_file('./logs/filelog-error.log', opts)
f = open('./logs/filelog-error.log','w')
f.write(res)
f.close()
exit()
