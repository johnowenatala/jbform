(function(){
  var initJBFormValidate = function(ns){
    if (!ns.initiated) {
      ns.initiated = true;

      ns.config = {
        messages: {
          required: 'Completa este campo para continuar',
          rut: 'Rut inválido. Revise que el rut y el dígito verificador sean correctos.',
          phone: 'Teléfono inválido. Utilice formato +56 XXX XXX XXX (9 dígitos)'
        }
      };

      /* elements management */

      ns.container = function($field) {
        return $field.closest('.form-group');
      };

      ns.errorElement = function($field){
        var $container = ns.container($field);
        var $element = $container.find('.invalid-feedback');
        if ($element.length == 0) {
          $field.after('<div class="invalid-feedback"></div>');
          $element = $container.find('.invalid-feedback');
        }
        return $element;
      };

      /* error management */

      ns.setError = function($field, errorType){
        $field.addClass('is-invalid').removeClass('is-valid');
        ns.container($field).addClass('form-group-invalid').removeClass('form-group-valid');
        ns.errorElement($field).text(ns.config.messages[errorType]);
      };

      ns.hasError = function($field){
        return $field.hasClass('is-invalid');
      };

      ns.clearError = function($field){
        var $container = ns.container($field);
        if (ns.hasError($field)) {
          $field.addClass('is-valid');
          $container.addClass('form-group-valid');
        }
        $field.removeClass('is-invalid');
        $container.removeClass('form-group-invalid');
        $container.find('.invalid-feedback').remove();
      };

      /* available validations */

      ns.validateRequired = function($field) {
        if (!$field.val()) {
          ns.setError($field,'required');
        }
      };

      ns.validateRut = function($field) {

        var rut = $field.val();

        if (!rut) {
          return;
        }

        /*
        validacion de rut basada en https://github.com/jlobos/rut.js/
        */
        rut = typeof rut === 'string'
            ? rut.replace(/^0+|[^0-9kK]+/g, '').toUpperCase()
            : null;

        var validRut = false;

        if (rut && typeof rut === 'string') {
          var rutLength = rut.length;
          if (2 <= rutLength && rutLength <= 10 ) { // largo minimo: Y-K (2) maximo: rut 100 millones 100XXXYYY-K (10)
            var t = parseInt(rut.slice(0, -1), 10);
            var m = 0;
            var s = 1;
            while (t > 0) {
              s = (s + (t % 10) * (9 - m++ % 6)) % 11;
              t = Math.floor(t / 10);
            }
            var v = s > 0 ? '' + (s - 1) : 'K';
            validRut = (v === rut.slice(-1));
          }
        }

        if (!validRut) {
          ns.setError($field,'rut');
        }
      };

      ns.validatePhone = function($field) {
        var phone = $field.val();

        if (!phone) {
          return;
        }


        phone = typeof phone === 'string'
            ? phone.replace(/[^0-9+]+/g, '')
            : null;

        var validPhone = false;

        if (phone && typeof phone === 'string') {
          validPhone = RegExp('(\\+56)?[0-9]{9}').test(phone)
        }

        if (!validPhone) {
          ns.setError($field,'phone');
        }
      };

      ns.validate = function($field) {
        var validation, i;
        var validations = $field.data('validate');
        ns.clearError($field);
        if (!Array.isArray(validations)) {
          validations = [validations];
        }
        if ($field.is('.required, [required]') && validations.indexOf('required') === -1) {
          validations.push('required');
        }
        for (i = 0; i < validations.length; i++) {
          validation = validations[i];
          // validaciones implementadas:
          switch (validation) {
            case 'required':
              ns.validateRequired($field);
              break;
            case 'rut':
              $field.trigger('jsform:preformat:rut');
              ns.validateRut($field);
              break;
            case 'phone':
              $field.trigger('jsform:preformat:phone');
              ns.validatePhone($field);
              break;
          }
        }
      };

      ns.controls = function($form) {
        return $form.find('input.form-control,select.form-control,textarea.form-control');
      };

      ns.validateFormOnSubmit = function(submitEvent) {
        var $controls = ns.controls($(this));
        $controls.each(function(){
          ns.validate($(this));
        });
        if ($controls.hasClass('is-invalid')) {
          submitEvent.preventDefault();
          submitEvent.stopPropagation();
        }
      };

      ns.validateFieldsOn = function($form) {
        var $controls = ns.controls($form);
        $controls.each(function(){
          var $control = $(this);
          var validateEvent = $control.data('validateOn');
          if (validateEvent) {
            $control.on(validateEvent, function(){
              ns.validate($(this));
            });
          }
        });
      };


      /* automatizacion */
      $('form.jbform').each(function(){
        var $form = $(this);
        $form.on('submit',ns.validateFormOnSubmit);
        $form.on('change','.form-control.is-invalid',function(){
          ns.validate($(this));
        });
        ns.validateFieldsOn($form);
      });

    }
  };

  var FBForm = { initiated: false };
  $(function(){ initJBFormValidate(FBForm) });
  $(document).on('turbolinks:load', function(){ initJBFormValidate(FBForm) });

})();
