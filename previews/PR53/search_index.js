var documenterSearchIndex = {"docs":
[{"location":"preallocationtools/#API","page":"API","title":"API","text":"","category":"section"},{"location":"preallocationtools/","page":"API","title":"API","text":"Modules = [PreallocationTools]","category":"page"},{"location":"preallocationtools/#PreallocationTools.DiffCache","page":"API","title":"PreallocationTools.DiffCache","text":"DiffCache(u::AbstractArray, N::Int = ForwardDiff.pickchunksize(length(u)); levels::Int = 1) DiffCache(u::AbstractArray; N::AbstractArray{<:Int})\n\nBuilds a DiffCache object that stores both a version of the cache for u and for the Dual version of u, allowing use of pre-cached vectors with forward-mode automatic differentiation. Supports nested AD via keyword levels or specifying an array of chunk_sizes.\n\n\n\n\n\n","category":"type"},{"location":"preallocationtools/#PreallocationTools.FixedSizeDiffCache-Union{Tuple{AbstractArray}, Tuple{N}, Tuple{AbstractArray, Type{Val{N}}}} where N","page":"API","title":"PreallocationTools.FixedSizeDiffCache","text":"FixedSizeDiffCache(u::AbstractArray, N = Val{default_cache_size(length(u))})\n\nBuilds a DualCache object that stores both a version of the cache for u and for the Dual version of u, allowing use of pre-cached vectors with forward-mode automatic differentiation.\n\n\n\n\n\n","category":"method"},{"location":"preallocationtools/#PreallocationTools.LazyBufferCache","page":"API","title":"PreallocationTools.LazyBufferCache","text":"b = LazyBufferCache(f=identity)\n\nA lazily allocated buffer object.  Given an array u, b[u] returns an array of the same type and size f(size(u)) (defaulting to the same size), which is allocated as needed and then cached within b for subsequent usage.\n\n\n\n\n\n","category":"type"},{"location":"preallocationtools/#PreallocationTools.get_tmp-Union{Tuple{T}, Tuple{DiffCache, T}} where T<:ForwardDiff.Dual","page":"API","title":"PreallocationTools.get_tmp","text":"get_tmp(dc::DiffCache, u)\n\nReturns the Dual or normal cache array stored in dc based on the type of u.\n\n\n\n\n\n","category":"method"},{"location":"#PreallocationTools.jl","page":"Home","title":"PreallocationTools.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"PreallocationTools.jl is a set of tools for helping build non-allocating pre-cached functions for high-performance computing in Julia. Its tools handle edge cases of automatic differentiation to make it easier for users to get high performance even in the cases where code generation may change the function that is being called.","category":"page"},{"location":"#dualcache","page":"Home","title":"dualcache","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"dualcache is a method for generating doubly-preallocated vectors which are compatible with non-allocating forward-mode automatic differentiation by ForwardDiff.jl. Since ForwardDiff uses chunked duals in its forward pass, two vector sizes are required in order for the arrays to be properly defined. dualcache creates a dispatching type to solve this, so that by passing a qualifier it can automatically switch between the required cache. This method is fully type-stable and non-dynamic, made for when the highest performance is needed.","category":"page"},{"location":"#Using-dualcache","page":"Home","title":"Using dualcache","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"dualcache(u::AbstractArray, N::Int=ForwardDiff.pickchunksize(length(u)); levels::Int = 1)\ndualcache(u::AbstractArray, N::AbstractArray{<:Int})","category":"page"},{"location":"","page":"Home","title":"Home","text":"The dualcache function builds a DualCache object that stores both a version of the cache for u and for the Dual version of u, allowing use of pre-cached vectors with forward-mode automatic differentiation. Note that dualcache, due to its design, is only compatible with arrays that contain concretely typed elements.","category":"page"},{"location":"","page":"Home","title":"Home","text":"To access the caches, one uses:","category":"page"},{"location":"","page":"Home","title":"Home","text":"get_tmp(tmp::DualCache, u)","category":"page"},{"location":"","page":"Home","title":"Home","text":"When u has an element subtype of Dual numbers, then it returns the Dual version of the cache. Otherwise it returns the standard cache (for use in the calls without automatic differentiation).","category":"page"},{"location":"","page":"Home","title":"Home","text":"In order to preallocate to the right size, the dualcache needs to be specified to have the correct N matching the chunk size of the dual numbers or larger.  If the chunk size N specified is too large, get_tmp will automatically resize  when dispatching; this remains type-stable and non-allocating, but comes at the  expense of additional memory.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In a differential equation, optimization, etc., the default chunk size is computed from the state vector u, and thus if one creates the dualcache via dualcache(u) it will match the default chunking of the solver libraries.","category":"page"},{"location":"","page":"Home","title":"Home","text":"dualcache is also compatible with nested automatic differentiation calls through the levels keyword (N for each level computed using based on the size of the  state vector) or by specifying N as an array of integers of chunk sizes, which enables full control of chunk sizes on all differentation levels.","category":"page"},{"location":"#dualcache-Example-1:-Direct-Usage","page":"Home","title":"dualcache Example 1: Direct Usage","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"using ForwardDiff, PreallocationTools\nrandmat = rand(5, 3)\nsto = similar(randmat)\nstod = dualcache(sto)\n\nfunction claytonsample!(sto, τ, α; randmat=randmat)\n    sto = get_tmp(sto, τ)\n    sto .= randmat\n    τ == 0 && return sto\n\n    n = size(sto, 1)\n    for i in 1:n\n        v = sto[i, 2]\n        u = sto[i, 1]\n        sto[i, 1] = (1 - u^(-τ) + u^(-τ)*v^(-(τ/(1 + τ))))^(-1/τ)*α\n        sto[i, 2] = (1 - u^(-τ) + u^(-τ)*v^(-(τ/(1 + τ))))^(-1/τ)\n    end\n    return sto\nend\n\nForwardDiff.derivative(τ -> claytonsample!(stod, τ, 0.0), 0.3)\nForwardDiff.jacobian(x -> claytonsample!(stod, x[1], x[2]), [0.3; 0.0])","category":"page"},{"location":"","page":"Home","title":"Home","text":"In the above, the chunk size of the dual numbers has been selected based on the size of randmat, resulting in a chunk size of 8 in this case. However, since the derivative  is calculated with respect to τ and the Jacobian is calculated with respect to τ and α,  specifying the dualcache with stod = dualcache(sto, 1) or stod = dualcache(sto, 2),  respectively, would have been the most memory efficient way of performing these calculations (only really relevant for much larger problems).","category":"page"},{"location":"#dualcache-Example-2:-ODEs","page":"Home","title":"dualcache Example 2: ODEs","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"using LinearAlgebra, OrdinaryDiffEq\nfunction foo(du, u, (A, tmp), t)\n    mul!(tmp, A, u)\n    @. du = u + tmp\n    nothing\nend\nprob = ODEProblem(foo, ones(5, 5), (0., 1.0), (ones(5,5), zeros(5,5)))\nsolve(prob, TRBDF2())","category":"page"},{"location":"","page":"Home","title":"Home","text":"fails because tmp is only real numbers, but during automatic differentiation we need tmp to be a cache of dual numbers. Since u is the value that will have the dual numbers, we dispatch based on that:","category":"page"},{"location":"","page":"Home","title":"Home","text":"using LinearAlgebra, OrdinaryDiffEq, PreallocationTools\nfunction foo(du, u, (A, tmp), t)\n    tmp = get_tmp(tmp, u)\n    mul!(tmp, A, u)\n    @. du = u + tmp\n    nothing\nend\nchunk_size = 5\nprob = ODEProblem(foo, ones(5, 5), (0., 1.0), (ones(5,5), dualcache(zeros(5,5), chunk_size)))\nsolve(prob, TRBDF2(chunk_size=chunk_size))","category":"page"},{"location":"","page":"Home","title":"Home","text":"or just using the default chunking:","category":"page"},{"location":"","page":"Home","title":"Home","text":"using LinearAlgebra, OrdinaryDiffEq, PreallocationTools\nfunction foo(du, u, (A, tmp), t)\n    tmp = get_tmp(tmp, u)\n    mul!(tmp, A, u)\n    @. du = u + tmp\n    nothing\nend\nchunk_size = 5\nprob = ODEProblem(foo, ones(5, 5), (0., 1.0), (ones(5,5), dualcache(zeros(5,5))))\nsolve(prob, TRBDF2())","category":"page"},{"location":"#dualcache-Example-3:-Nested-AD-calls-in-an-optimization-problem-involving-a-Hessian-matrix","page":"Home","title":"dualcache Example 3: Nested AD calls in an optimization problem involving a Hessian matrix","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"using LinearAlgebra, OrdinaryDiffEq, PreallocationTools, Optim, Optimization\nfunction foo(du, u, p, t)\n    tmp = p[2]\n    A = reshape(p[1], size(tmp.du))\n    tmp = get_tmp(tmp, u)\n    mul!(tmp, A, u)\n    @. du = u + tmp\n    nothing\nend\n\ncoeffs = -collect(0.1:0.1:0.4)\ncache = dualcache(zeros(2,2), levels = 3)\nprob = ODEProblem(foo, ones(2, 2), (0., 1.0), (coeffs, cache))\nrealsol = solve(prob, TRBDF2(), saveat = 0.0:0.1:10.0, reltol = 1e-8)\n\nfunction objfun(x, prob, realsol, cache)\n    prob = remake(prob, u0 = eltype(x).(prob.u0), p = (x, cache))\n    sol = solve(prob, TRBDF2(), saveat = 0.0:0.1:10.0, reltol = 1e-8)\n\n    ofv = 0.0\n    if any((s.retcode != :Success for s in sol))\n        ofv = 1e12\n    else\n        ofv = sum((sol.-realsol).^2)\n    end    \n    return ofv\nend\nfn(x,p) = objfun(x, p[1], p[2], p[3])\noptfun = OptimizationFunction(fn, Optimization.AutoForwardDiff())\noptprob = OptimizationProblem(optfun, zeros(length(coeffs)), (prob, realsol, cache))\nsolve(optprob, Newton())","category":"page"},{"location":"","page":"Home","title":"Home","text":"Solves an optimization problem for the coefficients, coeffs, appearing in a differential equation. The optimization is done with Optim.jl's Newton()  algorithm. Since this involves automatic differentiation in the ODE solver and the calculation  of Hessians, three automatic differentiations are nested within each other. Therefore, the dualcache  is specified with levels = 3. ","category":"page"},{"location":"#LazyBufferCache","page":"Home","title":"LazyBufferCache","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"LazyBufferCache(f::F=identity)","category":"page"},{"location":"","page":"Home","title":"Home","text":"A LazyBufferCache is a Dict-like type for the caches which automatically defines new cache arrays on demand when they are required. The function f maps size_of_cache = f(size(u)), which by default creates cache arrays of the same size.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Note that LazyBufferCache does cause a dynamic dispatch, though it is type-stable. This gives it a ~100ns overhead, and thus on very small problems it can reduce performance, but for any sufficiently sized calculation (e.g. >20 ODEs) this may not be even measurable. The upside of LazyBufferCache is that the user does not have to worry about potential issues with chunk sizes and such: LazyBufferCache is much easier!","category":"page"},{"location":"#Example","page":"Home","title":"Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"using LinearAlgebra, OrdinaryDiffEq, PreallocationTools\nfunction foo(du, u, (A, lbc), t)\n    tmp = lbc[u]\n    mul!(tmp, A, u)\n    @. du = u + tmp\n    nothing\nend\nprob = ODEProblem(foo, ones(5, 5), (0., 1.0), (ones(5,5), LazyBufferCache()))\nsolve(prob, TRBDF2())","category":"page"},{"location":"#Note-About-ReverseDiff-Support-for-LazyBuffer","page":"Home","title":"Note About ReverseDiff Support for LazyBuffer","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"ReverseDiff support is done in SciMLSensitivity.jl to reduce the AD requirements on this package. Load that package if ReverseDiff overloads are required.","category":"page"},{"location":"#Similar-Projects","page":"Home","title":"Similar Projects","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"AutoPreallocation.jl tries to do this automatically at the compiler level. Alloc.jl tries to do this with a bump allocator.","category":"page"},{"location":"#Contributing","page":"Home","title":"Contributing","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Please refer to the SciML ColPrac: Contributor's Guide on Collaborative Practices for Community Packages for guidance on PRs, issues, and other matters relating to contributing to SciML.\nSee the SciML Style Guide for common coding practices and other style decisions.\nThere are a few community forums:\nThe #diffeq-bridged and #sciml-bridged channels in the Julia Slack\nThe #diffeq-bridged and #sciml-bridged channels in the Julia Zulip\nOn the Julia Discourse forums\nSee also SciML Community page","category":"page"},{"location":"#Reproducibility","page":"Home","title":"Reproducibility","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"<details><summary>The documentation of this SciML package was built using these direct dependencies,</summary>","category":"page"},{"location":"","page":"Home","title":"Home","text":"using Pkg # hide\nPkg.status() # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"</details>","category":"page"},{"location":"","page":"Home","title":"Home","text":"<details><summary>and using this machine and Julia version.</summary>","category":"page"},{"location":"","page":"Home","title":"Home","text":"using InteractiveUtils # hide\nversioninfo() # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"</details>","category":"page"},{"location":"","page":"Home","title":"Home","text":"<details><summary>A more complete overview of all dependencies and their versions is also provided.</summary>","category":"page"},{"location":"","page":"Home","title":"Home","text":"using Pkg # hide\nPkg.status(;mode = PKGMODE_MANIFEST) # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"</details>","category":"page"},{"location":"","page":"Home","title":"Home","text":"You can also download the \n<a href=\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"using TOML\nversion = TOML.parse(read(\"../../Project.toml\",String))[\"version\"]\nname = TOML.parse(read(\"../../Project.toml\",String))[\"name\"]\nlink = \"https://github.com/SciML/\"*name*\".jl/tree/gh-pages/v\"*version*\"/assets/Manifest.toml\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"\">manifest</a> file and the\n<a href=\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"using TOML\nversion = TOML.parse(read(\"../../Project.toml\",String))[\"version\"]\nname = TOML.parse(read(\"../../Project.toml\",String))[\"name\"]\nlink = \"https://github.com/SciML/\"*name*\".jl/tree/gh-pages/v\"*version*\"/assets/Project.toml\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"\">project</a> file.","category":"page"}]
}
